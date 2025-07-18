"use client";
import { Button } from "@/components/ui/button";
import { Play, Settings } from "lucide-react";
import Link from "next/link";

interface ActionButtonsProps {
  onTestSetup: () => void;
}

const ActionButtons = ({ onTestSetup }: ActionButtonsProps) => {
  return (
    <div className="flex gap-4">
      <Button
        onClick={onTestSetup}
        variant="outline"
        className="flex-1 h-12 bg-transparent cursor-pointer"
      >
        <Settings className="w-4 h-4 mr-2" />
        Test Setup
      </Button>
      <Link href="/interview" className="flex-1">
        <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer">
          <Play className="w-4 h-4 mr-2" />
          Start Interview
        </Button>
      </Link>
    </div>
  );
};

export default ActionButtons;
