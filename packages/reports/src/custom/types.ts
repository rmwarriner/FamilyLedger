export interface CustomReportDefinition {
  id: string;
  name: string;
  query: string;
  dimensions: string[];
  metrics: string[];
}
