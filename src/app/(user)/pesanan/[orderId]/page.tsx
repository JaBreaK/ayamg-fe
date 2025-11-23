"use client";

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // <-- Pastikan Image di-import
import { API_BASE_URL } from '@/lib/config';

// Gabungkan Tipe Data
type MetodePembayaran = {
    nama_metode: string;
    nomor_rekening: string | null;
    nama_rekening: string | null;
    gambar_qris_url: string | null;
};
type Order = {
    id: number;
    status_pembayaran: string;
    total_harga: number;
    status_pesanan: string;
    keterangan_batal: string | null; // <-- TAMBAHKAN INI
    catatan_pelanggan: string | null;
    orderitems: {
        jumlah: number;
        produk: { nama_produk: string };
    }[];
    pembayaran: {
        metodepembayaran: MetodePembayaran;
    }[];
};

// Komponen terpisah untuk Indikator Status
const StatusIndicator = ({ statusBayar, statusPesanan }: { statusBayar: string, statusPesanan: string }) => {
    let bgColor = "bg-gray-500";
    let text = "Status Tidak Dikenal";
    let info = "Hubungi admin untuk informasi lebih lanjut.";

    if (statusBayar === 'BATAL') {
        bgColor = "bg-red-500";
        text = "Pesanan Dibatalkan";
        info = "Pesanan ini telah dibatalkan oleh admin.";
    } else if (statusBayar !== 'LUNAS') {
        bgColor = "bg-yellow-500";
        text = "Menunggu Pembayaran";
        if (statusBayar === 'MENUNGGU_KONFIRMASI') {
            bgColor = "bg-blue-500";
            text = "Pembayaran Sedang Diverifikasi";
            info = "Bukti pembayaranmu sudah kami terima dan akan segera diperiksa.";
        } else {
            info = "Silakan lakukan pembayaran dan upload bukti di bawah ini.";
        }
    } else { // Jika statusBayar adalah LUNAS
        switch (statusPesanan) {
            case "PESANAN_DITERIMA":
                bgColor = "bg-green-500";
                text = "Pembayaran Berhasil & Pesanan Diterima";
                info = "Pesananmu telah kami terima dan akan segera masuk antrean dapur.";
                break;
            case "SEDANG_DIMASAK":
                bgColor = "bg-teal-500";
                text = "Pesanan Sedang Dimasak";
                info = "Tim dapur kami sedang menyiapkan pesananmu. Mohon ditunggu!";
                break;
            case "SIAP_DIAMBIL":
                bgColor = "bg-purple-500";
                text = "Pesanan Siap Diambil!";
                info = "Hore! Pesananmu sudah selesai dimasak dan siap untuk diambil.";
                break;
            case "SELESAI":
                bgColor = "bg-gray-800";
                text = "Pesanan Selesai";
                info = "Terima kasih telah memesan dari kami.";
                break;
        }
    }

    return (
        <div className={`p-6 rounded-lg text-white text-center ${bgColor} transition-colors duration-500`}>
            <p className="font-bold text-xl">{text}</p>
            <p className="text-sm mt-1">{info}</p>
        </div>
    );
};

export default function PesananDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [buktiBayar, setBuktiBayar] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setMessage] = useState("");

    // REF UNTUK AUDIO DAN STATUS SEBELUMNYA
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevStatusRef = useRef<string | null>(null);
    // EFEK BARU UNTUK MEMUTAR SUARA
    useEffect(() => {
        if (order) {
            // Gabungkan status bayar dan status pesanan menjadi satu string unik
            const currentStatus = `${order.status_pembayaran}-${order.status_pesanan}`;

            // Cek apakah ini bukan render pertama DAN statusnya berubah
            if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
                // Mainkan suara notifikasi
                audioRef.current?.play().catch(error => console.log("Gagal memutar audio:", error));
            }

            // Simpan status saat ini untuk perbandingan di render berikutnya
            prevStatusRef.current = currentStatus;
        }
    }, [order]);

    const fetchOrder = useCallback(async () => {
        if (orderId) {
            const savedNomorWa = localStorage.getItem('customer_nomor_wa');
            if (!savedNomorWa) {
                setOrder(null);
                setIsLoading(false);
                return;
            }
            const response = await fetch(`${API_BASE_URL}/public/orders/${orderId}?nomorWa=${savedNomorWa}`);
            if (response.ok) {
                setOrder(await response.json());
            } else {
                setOrder(null);
            }
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        // Ambil data pertama kali saat halaman dimuat
        fetchOrder();

        // Setelah itu, set interval untuk mengambil data setiap 5 detik
        const intervalId = setInterval(() => {
            console.log("Checking for order updates...");
            fetchOrder();
        }, 5000); // 5000 milidetik = 5 detik

        // PENTING: Hentikan interval saat komponen di-unmount (ditinggalkan)
        // agar tidak berjalan selamanya.
        return () => clearInterval(intervalId);
    }, [fetchOrder]); // useEffect akan berjalan lagi jika fetchOrder berubah

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!buktiBayar) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append("bukti", buktiBayar);

        const response = await fetch(`${API_BASE_URL}/public/konfirmasi-pembayaran/${orderId}`, {
            method: "POST", body: formData,
        });

        if (response.ok) {
            setMessage("Upload berhasil! Status akan segera terupdate.");
            await fetchOrder();
        } else {
            setMessage("Upload gagal, coba lagi.");
        }
        setIsLoading(false);
    };

    const handleCheckStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/public/orders/${orderId}/check-status`);
            const data = await response.json();
            if (data.status === 'LUNAS') {
                setMessage("Pembayaran berhasil dikonfirmasi!");
                await fetchOrder();
            } else {
                setMessage("Pembayaran belum masuk. Silakan coba lagi nanti.");
            }
        } catch (error) {
            console.error("Error checking status:", error);
            setMessage("Gagal mengecek status.");
        }
        setIsLoading(false);
    };

    if (isLoading) return <p className="p-8 text-center">Memuat pesanan...</p>;
    if (!order) return <p className="p-8 text-center">Pesanan tidak ditemukan atau Anda tidak memiliki akses.</p>;

    const metodePembayaran = order.pembayaran?.[0]?.metodepembayaran;

    return (
        <main className="container mx-auto p-4 md:p-8 flex justify-center bg-gray-50 min-h-screen">
            <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-2xl w-full h-fit">
                <h1 className="text-2xl font-bold mb-2">Detail Pesanan #{order.id}</h1>
                <p className="text-gray-500 mb-6">Terima kasih atas pesananmu!</p>

                <StatusIndicator statusBayar={order.status_pembayaran} statusPesanan={order.status_pesanan} />

                {order.status_pembayaran === 'BATAL' && order.keterangan_batal && (
                    <div className="my-6 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg text-left">
                        <p className="font-bold">Pesanan Dibatalkan</p>
                        <p>Alasan: {order.keterangan_batal}</p>
                    </div>
                )}

                <div className="my-6 border-t pt-6 text-left">
                    <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
                    <ul className="mb-4 space-y-1">
                        {order.orderitems.map((item, index) => (
                            <li key={index} className="flex justify-between text-gray-700">
                                <span>{item.jumlah}x {item.produk.nama_produk}</span>
                            </li>
                        ))}
                    </ul>
                    {order.catatan_pelanggan && (
                        <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                            <p className="font-semibold text-sm">Catatan Anda:</p>
                            <p className="text-gray-700 text-sm">{order.catatan_pelanggan}</p>
                        </div>
                    )}
                    <hr className="my-4" />
                    <div className="flex justify-between font-bold text-lg mt-2">
                        <span>TOTAL</span>
                        <span>Rp {order.total_harga.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {order.status_pembayaran === 'BELUM_BAYAR' && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-left">
                        <h2 className="text-xl font-bold mb-4">Pembayaran</h2>
                        <p className="mb-4">Silakan selesaikan pembayaran Anda.</p>

                        <button
                            onClick={() => {
                                // Re-generate Pakasir URL or use saved one if we had it.
                                // For simplicity, we can construct it here or call an API to get the payment link.
                                // Since we don't store the link, let's reconstruct it or call an endpoint.
                                // A better way is to have an endpoint /api/public/orders/:id/pay that returns the URL.
                                // BUT, for now, let's assume the user just created the order and was redirected.
                                // If they come back later, we need to generate the link again.
                                // Let's use the same logic as backend:
                                const slug = "bellonime"; // Should ideally come from config/env
                                const redirectUrl = window.location.href;
                                const paymentUrl = `https://app.pakasir.com/pay/${slug}/${Math.ceil(order.total_harga)}?order_id=${order.id}&redirect=${encodeURIComponent(redirectUrl)}`;
                                window.location.href = paymentUrl;
                            }}
                            className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700"
                        >
                            Bayar Sekarang
                        </button>

                        <button
                            onClick={handleCheckStatus}
                            className="w-full mt-2 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600"
                        >
                            Cek Status Pembayaran
                        </button>
                    </div>
                )}

                <Link href="/menu" className="mt-8 inline-block text-blue-600 hover:underline">
                    ‹ Kembali ke Menu
                </Link>
            </div>
        </main>
    );
}