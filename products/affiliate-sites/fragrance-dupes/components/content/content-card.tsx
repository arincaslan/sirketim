import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ContentFrontmatter } from "@/content/schema";

const TYPE_LABEL: Record<ContentFrontmatter["contentType"], string> = {
  guide: "Guide",
  comparison: "Comparison",
  review: "Review",
};

export function ContentCard({ frontmatter }: { frontmatter: ContentFrontmatter }) {
  return (
    <Link
      href={`/${frontmatter.contentType}/${frontmatter.slug}`}
      data-cursor="view"
      className="group flex flex-col gap-3 rounded-frame border border-border bg-card p-5 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99]"
    >
      <Badge variant="outline" className="w-fit">
        {TYPE_LABEL[frontmatter.contentType]}
      </Badge>
      <h3 className="font-display text-xl leading-snug transition-colors group-hover:text-primary">
        {frontmatter.title}
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{frontmatter.description}</p>
      <time dateTime={frontmatter.publishedAt} className="text-xs text-muted-foreground">
        {new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </time>
    </Link>
  );
}
