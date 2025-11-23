"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { API_BASE_URL } from '@/lib/config';

type Produk = {
    id: number;
    nama_produk: string;
    deskripsi: string | null;
    harga: number;
    gambar_url: string | null;
};

export default function ProdukDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [produk, setProduk] = useState<Produk | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduk = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/menu/${id}`);
                if (response.ok) {
                    setProduk(await response.json());
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
            setIsLoading(false);
        };

        if (id) fetchProduk();
    }, [id]);

    if (isLoading) {
        return <p className="p-8 text-center">Loading...</p>;
    }

    if (!produk) {
        return <p className="p-8 text-center">Produk tidak ditemukan.</p>
    }

    return (
        <main className="container mx-auto p-8 pt-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Kolom Gambar */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={produk.gambar_url || '/placeholder.png'}
                        alt={produk.nama_produk}
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                </div>
                {/* Kolom Detail */}
                <div className="sticky top-28">
                    <h1 className="text-4xl font-bold font-serif mb-4">{produk.nama_produk}</h1>
                    <p className="text-3xl font-semibold text-blue-600 mb-6">
                        Rp {produk.harga.toLocaleString('id-ID')}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        {produk.deskripsi}
                    </p>

                    {/* Nanti tombol ini bisa kita buat fungsional */}
                    <button className="w-full bg-[#F0A04B] rounded-full text-white font-bold py-3 px-4 rounded hover:bg-black">
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </main>
    );
}