"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SafeImage({ src, fallback = "https://picsum.photos/1200/800", ...props }) {
  const [imgSrc, setImgSrc] = useState(src && String(src).trim() !== "" ? src : fallback);

  useEffect(() => {
    setImgSrc(src && String(src).trim() !== "" ? src : fallback);
  }, [src, fallback]);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallback);
      }}
    />
  );
}
