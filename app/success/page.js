import { Suspense } from "react";
import SuccessPage from "@/components/SuccessPage";

export default function SuccessWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPage />
    </Suspense>
  )
}
