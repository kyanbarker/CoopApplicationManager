interface JobDetails {
  title: string;
  company: string;
  location: string;
  type: string;
  deadline: string;
  url: string;
}

interface JobApplicationDetails extends JobDetails {
  status: string;
  pay_per_hour?: number;
  notes: string;
}
