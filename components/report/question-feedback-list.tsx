import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { QuestionFeedbackItem } from "@/types/domain/report";
import { cn } from "@/lib/utils";

function scoreTone(score: number): string {
  if (score >= 7) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-destructive";
}

export function QuestionFeedbackList({ items }: { items: QuestionFeedbackItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="p-lg">
      <h3 className="mb-lg font-headline-md text-headline-md text-foreground">Question-by-Question Feedback</h3>
      <Accordion multiple>
        {items.map((item, index) => (
          <AccordionItem key={item.questionId} value={String(index)}>
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between gap-md pr-4">
                <span className="line-clamp-1 text-left font-medium text-foreground">{item.question}</span>
                <Badge variant="outline" className={cn("shrink-0", scoreTone(item.score))}>
                  {item.score.toFixed(1)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-md text-body-sm">
                <div>
                  <p className="mb-1 font-label-sm text-label-sm uppercase text-muted-foreground">
                    Your answer
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">{item.candidateAnswer}</p>
                </div>

                {item.strengths.length > 0 && (
                  <div>
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-success">Strengths</p>
                    <ul className="list-disc pl-lg text-foreground">
                      {item.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.missingPoints.length > 0 && (
                  <div>
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-warning">
                      Missing points
                    </p>
                    <ul className="list-disc pl-lg text-foreground">
                      {item.missingPoints.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.idealAnswer && (
                  <div>
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-muted-foreground">
                      Ideal answer
                    </p>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{item.idealAnswer}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {item.improvementAdvice && (
                  <div>
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-primary">
                      How to improve
                    </p>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{item.improvementAdvice}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
