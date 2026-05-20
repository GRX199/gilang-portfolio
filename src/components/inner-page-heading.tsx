import Link from "next/link";

type InnerPageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function InnerPageHeading({ eyebrow, title, description }: InnerPageHeadingProps) {
  return (
    <section className="inner-hero" aria-labelledby="inner-page-title">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="inner-page-title">{title}</h1>
        <p className="lead">{description}</p>
        <p className="back-line">
          - Or just <Link href="/">go back home</Link>.
        </p>
      </div>
    </section>
  );
}
