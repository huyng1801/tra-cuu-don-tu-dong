// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerForm } from "@/features/customers/customer-form";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  createCustomerAction: vi.fn(),
  updateCustomerAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/features/customers/actions", () => ({
  createCustomerAction: mocks.createCustomerAction,
  updateCustomerAction: mocks.updateCustomerAction,
}));

describe("CustomerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates customer and redirects to detail page", async () => {
    mocks.createCustomerAction.mockResolvedValue({
      success: true,
      message: "Đã tạo khách hàng mới.",
      customerId: "customer-1",
    });

    render(createElement(CustomerForm, { mode: "create" }));
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Họ tên"), "Tran Thi C");
    await user.type(screen.getByLabelText("Số điện thoại"), "0901000000");
    await user.click(screen.getByRole("button", { name: "Tạo khách hàng" }));

    await waitFor(() => {
      expect(mocks.createCustomerAction).toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/customers/customer-1");
    });
  });
});
