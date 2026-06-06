// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderForm } from "@/features/orders/order-form";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  createOrderAction: vi.fn(),
  updateOrderAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/features/orders/actions", () => ({
  createOrderAction: mocks.createOrderAction,
  updateOrderAction: mocks.updateOrderAction,
}));

describe("OrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows computed total price as user edits quantity and price", async () => {
    render(
      createElement(OrderForm, {
        mode: "create",
        customers: [{ id: "1", name: "Customer A", phone: "0901" }],
        defaultValues: {
          customer_mode: "new",
          status: "new",
        },
      }),
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Ten khach moi"), "Pham D");
    await user.type(screen.getByLabelText("So dien thoai"), "0902222222");
    await user.type(screen.getByLabelText("Ten san pham"), "San pham test");

    const quantityInput = screen.getByLabelText("So luong");
    await user.clear(quantityInput);
    await user.type(quantityInput, "3");

    const priceInput = screen.getByLabelText("Gia ban");
    await user.clear(priceInput);
    await user.type(priceInput, "50000");

    expect(screen.getByText(/150.000/)).toBeInTheDocument();
  });
});
