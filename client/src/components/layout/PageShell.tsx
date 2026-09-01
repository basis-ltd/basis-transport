import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The page grammar for the authenticated app.
 *
 * Every page used to build its own header, its own `surfaceCard` constant, and
 * its own definition-list markup, which is how three detail pages ended up with
 * three different title sizes, three card paddings, and two different ways of
 * drawing a label/value pair. These four pieces are the whole vocabulary —
 * a page composes them and inherits the rhythm instead of restating it.
 */

/** One readable measure and vertical rhythm for every authenticated page. */
export const PageBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <main
    className={cn(
      "mx-auto flex w-full max-w-[1180px] flex-col gap-7",
      className,
    )}
  >
    {children}
  </main>
);

/**
 * Title, description, and an actions slot on one baseline. Actions align to
 * the bottom of the title block so a filter control and a heading share an
 * edge instead of floating against each other.
 */
export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => (
  <header
    className={cn(
      "app-page-header flex w-full flex-wrap items-end justify-between gap-4",
      className,
    )}
  >
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="type-page-title text-(--ink)">{title}</h1>
      {description ? (
        <p className="type-meta max-w-2xl">{description}</p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-end gap-3">{actions}</div>
    ) : null}
  </header>
);

/**
 * A framed section with an optional header. The shared card token provides a
 * visible edge and restrained depth against the route-map ground.
 */
export const PageSection = ({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) => (
  <section
    className={cn(
      "card-framed flex flex-col gap-5 p-5 sm:p-6",
      className,
    )}
  >
    {title || actions ? (
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          {title ? (
            <h2 className="type-card-title">{title}</h2>
          ) : null}
          {description ? <p className="type-meta">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </header>
    ) : null}
    <div className={cn("flex flex-col gap-5", bodyClassName)}>{children}</div>
  </section>
);

export interface DetailItem {
  label: string;
  value: ReactNode;
}

/**
 * Label above value, in a grid so columns line up across cards rather than
 * each list choosing its own width. Values are tabular: phone numbers, counts,
 * and dates only line up if the figures do.
 */
export const DetailList = ({
  items,
  columns = 2,
  className,
}: {
  items: DetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}) => (
  <dl
    className={cn(
      "grid gap-5",
      columns === 1
        ? "grid-cols-1"
        : columns === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2",
      className,
    )}
  >
    {items.map((item) => (
      <div key={item.label} className="flex min-w-0 flex-col gap-1">
        <dt className="type-meta">{item.label}</dt>
        <dd className="tabular text-sm font-medium text-(--ink)">
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);

/** The row that closes a page: reverse navigation on the left, meta on the right. */
export const PageFooter = ({
  children,
  meta,
}: {
  children?: ReactNode;
  meta?: ReactNode;
}) => (
  <footer className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
    {children ? (
      <div className="flex items-center gap-3">{children}</div>
    ) : null}
    {meta ? <p className="type-meta">{meta}</p> : null}
  </footer>
);

/**
 * The identity block at the top of a person's page: avatar, name, contact, and
 * status. Two pages drew this by hand and disagreed on the avatar size, the
 * status pill, and whether the email wrapped.
 */
export const IdentityCard = ({
  name,
  email,
  status,
  children,
}: {
  name?: string;
  email?: ReactNode;
  status?: ReactNode;
  children?: ReactNode;
}) => (
  <section className="card-framed flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
    <figure className="flex shrink-0 justify-center md:justify-start">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
          name ?? "",
        )}&background=000000&color=ffffff&size=120`}
        alt=""
        aria-hidden="true"
        className="size-24 rounded-(--radius-card) object-cover ring-1 ring-(--line)"
      />
      <figcaption className="sr-only">{name} profile picture</figcaption>
    </figure>
    <div className="flex min-w-0 flex-col items-center gap-2 md:items-start">
      <p className="type-card-title">{name}</p>
      {email ? (
        <p className="type-body-sm break-all text-(--muted)">{email}</p>
      ) : null}
      {status}
    </div>
    {children ? <div className="md:ml-auto">{children}</div> : null}
  </section>
);
