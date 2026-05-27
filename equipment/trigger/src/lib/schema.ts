import { z } from "zod";

export const GenerateLeadsInput = z.object({
  businessDescription: z.string().min(1).max(2000),
  icp: z.string().min(1).max(2000),
  leadType: z.string().min(1).max(200),
  region: z.string().max(200).optional(),
  count: z.number().int().min(1).max(10),
});

export type GenerateLeadsInput = z.infer<typeof GenerateLeadsInput>;

export const Lead = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  company: z.string().min(1),
  url: z.string().url(),
  email: z.string().email().optional(),
  source: z.string().min(1),
  snippet: z.string().min(1),
});

export type Lead = z.infer<typeof Lead>;

export const LeadArray = z.array(Lead);

export const GenerateLeadsOutput = z.object({
  runId: z.string(),
  leads: LeadArray,
});

export type GenerateLeadsOutput = z.infer<typeof GenerateLeadsOutput>;
