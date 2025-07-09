import Image from "next/image";
import Link from "next/link";

export default function AppLogo() {
  return (
    <Link href="/" className="-m-1.5 p-1.5">
      <span className="sr-only">Your Company</span>
      <Image
        src="/images/logo/Site-Logo.png"
        alt="Your Company Logo"
        width={150}
        height={50}
        className="w-auto"
      />
    </Link>
  );
}