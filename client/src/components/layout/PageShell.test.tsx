import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IdentityCard, PageBody, PageHeader, PageSection } from "./PageShell";
import "@/index.css";

describe("Authenticated page shell tokens", () => {
  it("caps titles at 13px and separates sections with shadow-sm, not borders", () => {
    const { container } = render(
      <PageBody>
        <PageHeader title="My profile" description="Manage your details." />
        <PageSection title="Personal information" description="Basic details.">
          <p>Phone number</p>
        </PageSection>
        <IdentityCard name="Ada" email="ada@example.com" />
      </PageBody>,
    );
    const title = screen.getByRole("heading", { name: "My profile" });
    expect(title).toHaveClass("type-page-title");
    expect(title).toHaveClass("text-[13px]");
    const section = container.querySelector("section.card-framed")!;
    expect(section).toHaveClass("shadow-sm");
    expect(section).toHaveClass("rounded-md");
    expect(section).toHaveClass("card-framed");
    expect(section.className).toMatch(/shadow-sm/);
    expect(
      screen.getByRole("heading", { name: "Personal information" }),
    ).toHaveClass("type-card-title");
    expect(
      screen.getByRole("heading", { name: "Personal information" }),
    ).toHaveClass("text-[13px]");
    const identity = screen.getByText("Ada").closest("section");
    expect(identity).toHaveClass("card-framed");
    expect(identity).toHaveClass("shadow-sm");
    expect(identity).toHaveClass("rounded-md");
  });
});
