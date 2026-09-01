import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "@/states/slices/authSlice";
import userSlice from "@/states/slices/userSlice";
import { UserStatus } from "@/constants/user.constants";
import UserDetailsPage from "./UserDetailsPage";

vi.mock("@/usecases/users/user.hooks", () => ({
  useGetUserById: () => ({
    getUserById: vi.fn(),
    userIsFetching: false,
  }),
}));

const staffUser = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phoneNumber: "+250780000000",
  status: UserStatus.ACTIVE,
  userRoles: [{ role: { name: "ADMIN" } }],
};

function renderDetails() {
  const store = configureStore({
    reducer: combineReducers({ auth: authSlice, user: userSlice }),
    preloadedState: {
      auth: {
        token: "staff-token",
        user: { status: UserStatus.ACTIVE, userRoles: staffUser.userRoles },
        isHydrated: true,
      },
      user: { user: staffUser, usersList: [], selectedUser: undefined },
    } as never,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/users/user-1"]}>
        <Routes>
          <Route path="/users/:id" element={<UserDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("UserDetailsPage surfaces", () => {
  it("renders identity and section cards with PageShell tokens", () => {
    const { container } = renderDetails();
    expect(screen.getByRole("heading", { name: "User details" })).toHaveClass(
      "type-page-title",
    );
    const cards = container.querySelectorAll("section.card-framed");
    expect(cards.length).toBeGreaterThanOrEqual(2);
    for (const card of cards) {
      expect(card).toHaveClass("card-framed");
      expect(card.className).not.toMatch(/shadow-sm/);
    }
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Personal information" }),
    ).toHaveClass("type-card-title");
  });
});
