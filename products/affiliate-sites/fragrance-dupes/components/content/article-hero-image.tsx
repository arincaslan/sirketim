import Image from "next/image";

export function ArticleHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-frame border border-border">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 768px, 100vw" className="object-cover" />
    </div>
  );
}
