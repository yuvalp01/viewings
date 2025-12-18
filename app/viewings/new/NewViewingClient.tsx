"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditViewingModal from "../components/EditViewingModal";
import Button from "@/app/components/Button";
import { ArrowLeftIcon } from "@/app/components/icons";

interface Stakeholder {
  id: number;
  name: string;
}

interface NewViewingClientProps {
  stakeholders: Stakeholder[];
}

export default function NewViewingClient({ stakeholders }: NewViewingClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/viewings");
  };

  return (
    <>
      <EditViewingModal
        viewing={null}
        stakeholders={stakeholders}
        isOpen={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}

