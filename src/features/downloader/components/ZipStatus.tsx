import { CheckCircle2, PackageOpen } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

type ZipStatusProps = {
  finishedZipFiles: string[];
  activeZip: string | null;
};

export function ZipStatus({ finishedZipFiles, activeZip }: ZipStatusProps) {
  const { t } = useI18n();

  const hasContent = finishedZipFiles.length > 0 || activeZip;

  return (
    <Accordion type="single" collapsible defaultValue={hasContent ? "zip-status" : undefined}>
      <AccordionItem value="zip-status" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2 text-sm font-medium">
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
            {t("downloader.zipStatus.title")}
            {finishedZipFiles.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {finishedZipFiles.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {!hasContent ? (
            <p className="text-xs text-muted-foreground italic">
              {t("downloader.zipStatus.empty")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {activeZip && !finishedZipFiles.includes(activeZip) && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground">{activeZip}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {t("downloader.zipStatus.active")}
                  </Badge>
                </div>
              )}
              {finishedZipFiles.map((zipFile) => (
                <div key={zipFile} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">{zipFile}</span>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
