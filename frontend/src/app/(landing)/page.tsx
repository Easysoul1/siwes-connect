// src/app/(landing)/page.tsx
// This is a server component — it just renders the client landing page.
// The "(landing)" route group means no layout wrapper is applied.

import LandingPage from "./LandingPage";

export const metadata = {
  title: "SIWES Connect — Find Your Place. Build Your Future.",
  description:
    "The SIWES marketplace connecting Nigerian students, organizations, and institutional coordinators for seamless placement management.",
  openGraph: {
    title: "SIWES Connect",
    description: "Smart SIWES placement matching for students, organizations, and coordinators.",
    type: "website",
  },
};

export default function Page() {
  return <LandingPage />;
}