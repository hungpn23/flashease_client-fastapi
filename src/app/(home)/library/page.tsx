import { findAll } from "@/app/(home)/_actions/find-paginated.action";
import { SetUI } from "@/app/(home)/_components/set";
import { Blockquote, BlockquoteAuthor } from "@/components/ui/blockquote";
import { Button } from "@/components/ui/button";
import { SetDetail } from "@/types/data/set.type";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function LibraryPage() {
  const data = await findAll<SetDetail>("/set/library");

  if ("statusCode" in data) throw new Error("failed to fetch data");

  return (
    <div className="flex flex-col flex-wrap">
      <Blockquote className="mb-4">
        Happiness lies not in the mere possession of money; it lies in the joy
        of achievement, in the thrill of creative effort.
        <BlockquoteAuthor>Franklin Roosevelt</BlockquoteAuthor>
      </Blockquote>

      <div className="mb-4 flex items-center">
        <p className="text-sm text-muted-foreground">
          Click a set to start learning.
        </p>

        <Button className="ml-auto mr-4 w-fit" asChild>
          <Link href="/create-set">
            Create set <Plus className="inline h-4 w-4" />
          </Link>
        </Button>
      </div>

      {data.map(({ set, metadata }) => (
        <SetUI path="library" key={set.id} set={set} metadata={metadata} />
      ))}
    </div>
  );
}
