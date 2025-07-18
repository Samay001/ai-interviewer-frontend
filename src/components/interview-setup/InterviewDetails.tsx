"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

interface Applicant {
  domain?: string;
  adminName?: string;
  // add other properties as needed
}

const InterviewDetails = ({}) => {
  const { currentApplicant } = useSelector(
    (state: RootState) => state.applicant as { currentApplicant: Applicant }
  );
  console.log("applicant", currentApplicant);
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Interview Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Domain</div>
          <div className="font-medium capitalize">
            {currentApplicant.domain}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Admin</div>
          <div className="font-medium capitalize">
            {currentApplicant.adminName}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Type</div>
          <div className="font-medium">AI Interview</div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <Badge variant="secondary">45 minutes</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewDetails;
