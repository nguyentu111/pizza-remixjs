import { Customer, Prisma, Staff } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getStaffById } from "~/models/staff.server";
import { getCustomerById } from "~/models/customer.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const STAFF_SESSION_KEY = "STAFF_SESSION";
const CUSTOMER_SESSION_KEY = "CUSTOMER_SESSION";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// Staff session functions
export async function getStaffId(
  request: Request,
): Promise<Staff["id"] | undefined> {
  const session = await getSession(request);
  const staffId = session.get(STAFF_SESSION_KEY);
  return staffId;
}

export async function getStaff(db: Prisma.TransactionClient, request: Request) {
  const staffId = await getStaffId(request);
  if (staffId === undefined) return null;

  const staff = await getStaffById(db, staffId);
  if (staff) return staff;

  throw await logout(request);
}

export async function requireStaffId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const staffId = await getStaffId(request);
  if (!staffId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/admin/login?${searchParams}`);
  }
  return staffId;
}

export async function requireStaff(
  db: Prisma.TransactionClient,
  request: Request,
) {
  const staffId = await requireStaffId(request);

  const staff = await getStaffById(db, staffId);
  if (staff) return staff;

  throw await logout(request);
}

export async function createStaffSession({
  request,
  staffId,
  remember,
  redirectTo,
}: {
  request: Request;
  staffId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(STAFF_SESSION_KEY, staffId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

// Customer session functions
export async function getCustomerId(
  request: Request,
): Promise<Customer["id"] | undefined> {
  const session = await getSession(request);
  const customerId = session.get(CUSTOMER_SESSION_KEY);
  return customerId;
}

export async function getCustomer(
  db: Prisma.TransactionClient,
  request: Request,
) {
  const customerId = await getCustomerId(request);
  if (customerId === undefined) return null;

  const customer = await getCustomerById(db, customerId);
  if (customer) return customer;

  throw await logout(request);
}

export async function requireCustomerId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const customerId = await getCustomerId(request);
  if (!customerId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return customerId;
}

export async function requireCustomer(
  db: Prisma.TransactionClient,
  request: Request,
) {
  const customerId = await requireCustomerId(request);

  const customer = await getCustomerById(db, customerId);
  if (customer) return customer;

  throw await logout(request);
}

export async function createCustomerSession({
  request,
  customerId,
  remember,
  redirectTo,
}: {
  request: Request;
  customerId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(CUSTOMER_SESSION_KEY, customerId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
