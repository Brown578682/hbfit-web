"use client";

import { useState } from "react";
import Image from "next/image";
import { ShopifyImage } from "@/lib/shopify";

interface Props {
  images: ShopifyImage[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-zinc-900 flex items-center justify-center">
        <span className="text-white/20 text-xs uppercase tracking-widest">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="aspect-square bg-zinc-900 relative overflow-hidden">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`aspect-square bg-zinc-900 relative overflow-hidden border-2 transition-all ${
                i === activeIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
