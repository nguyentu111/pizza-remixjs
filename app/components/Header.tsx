import { Link } from "@remix-run/react";
import { useOptionalCustomer } from "~/lib/utils";

export function Header() {
  const customer = useOptionalCustomer();
  return (
    <header className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Domino's Pizza
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/coupons">KHUYẾN MÃI</Link>
            </li>
            <li>
              <Link to="/menu">THỰC ĐƠN</Link>
            </li>
            <li>
              <Link to="/order">THEO DÕI ĐƠN</Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/account" className="text-xl">
            👤 {customer?.phoneNumbers}
          </Link>
          <Link to="/cart" className="text-xl">
            🛒
          </Link>
        </div>
      </div>
    </header>
  );
}
