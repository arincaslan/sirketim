import { Badge } from "@/components/ui/badge";

const TYPE_LABEL: Record<string, string> = {
  guide: "Guide",
  comparison: "Comparison",
  review: "Review",
};

export function ArticleHeader({
  contentType,
  title,
  description,
  publishedAt,
  author,
}: {
  contentType: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      <Badge variant="outline" className="w-fit">
        {TYPE_LABEL[contentType] ?? contentType}
      </Badge>
      <h1 className="max-w-[22ch] font-display text-fluid-h1">{title}</h1>
      <p className="max-w-[60ch] text-lg text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">
        By {author} &middot;{" "}
        <time dateTime={publishedAt}>
          {new Date(publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </p>
    </header>
  );
}
