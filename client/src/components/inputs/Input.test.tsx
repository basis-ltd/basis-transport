import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Input from "./Input";

describe("Native input contract", () => {
  it("associates the visible label with a unique input and forwards required and minimum", () => {
    render(
      <Input
        label="Walking distance"
        type="number"
        required
        min={1}
        max={400}
      />,
    );
    const input = screen.getByRole("spinbutton", {
      name: "Walking distance",
    }) as HTMLInputElement;
    expect(input.id).not.toBe("");
    expect(input).toBeRequired();
    expect(input.min).toBe("1");
    expect(input.max).toBe("400");
    expect(input.validity.valueMissing).toBe(true);
  });
  it("preserves explicit IDs and associates error descriptions", () => {
    render(
      <Input
        id="source-url"
        label="Source URL"
        type="url"
        errorMessage="Supply an HTTPS source."
      />,
    );
    const input = screen.getByRole("textbox", { name: "Source URL" });
    expect(input).toHaveAttribute("id", "source-url");
    expect(input).toHaveAttribute("aria-describedby", "source-url-message");
    expect(screen.getByRole("alert")).toHaveAttribute(
      "id",
      "source-url-message",
    );
  });
});
