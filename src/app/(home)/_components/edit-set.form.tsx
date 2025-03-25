"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisibleTo } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { convertToFormData } from "@/lib/convert-formdata";
import { showErrorDetail } from "@/lib/show-error-detail";
import { cn } from "@/lib/utils";
import { showErrorBorder } from "@/lib/show-error-border";
import { EditSet } from "@/app/(home)/_actions/edit-set";
import {
  EditSetInput,
  editSetSchema,
  EditSetState,
} from "@/app/(home)/_types/edit-set.type";
import { Set } from "@/types/data/set.type";
import { DeleteSet } from "@/app/(home)/_actions/delete-set";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function EditSetForm({ set }: { set: Set }) {
  const EditSetWithSetId = EditSet.bind(null, set.id);
  const [state, formAction, isPending] = useActionState<EditSetState, FormData>(
    EditSetWithSetId,
    {},
  );
  // Ánh xạ set.cards để đảm bảo id là string
  const normalizedCards = set.cards.map((card) => ({
    ...card,
    id: String(card.id),
  }));
  const form = useForm<EditSetInput>({
    resolver: zodResolver(editSetSchema),
    defaultValues: {
      name: set.name,
      description: set.description || "",
      visibleTo: set.visibleTo,
      passcode: set.passcode || "",
      cards: normalizedCards,
    },
  });
  const visibleTo = form.watch("visibleTo");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });
  const [isDeleting, startTransition] = useTransition();
  const errorDetails = state.error?.details;

  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (state.error && state.error.details === undefined)
      toast.error(state.error.message);

    if (state.success) {
      toast.success("Set updated successfully!");
      dialogCloseRef.current?.click();
    }
  }, [state]);

  //! Debug: Log validation errors
  // useEffect(() => {
  //   if (form.formState.errors) {
  //     console.error("Validation errors:", form.formState.errors);
  //   }
  // }, [form.formState.errors]);

  function onSubmit(data: EditSetInput) {
    const hasEmptyFields = data.cards.some(
      ({ term, definition }) => term.trim() === "" || definition.trim() === "",
    );

    if (hasEmptyFields)
      return toast.error("All terms and definitions must be filled");

    startTransition(() => formAction(convertToFormData(data)));
  }

  const router = useRouter();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Name</FormLabel>
              <FormControl>
                <div>
                  <Input
                    className="bg-background"
                    placeholder="Enter set name here"
                    {...field}
                  />

                  {errorDetails && showErrorDetail(errorDetails, "name")}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">
                Description (optional)
              </FormLabel>
              <FormControl>
                <div>
                  <Textarea
                    placeholder="Enter set description here"
                    {...field}
                  />

                  {errorDetails && showErrorDetail(errorDetails, "description")}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Visible To */}
        <FormField
          control={form.control}
          name="visibleTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Visible To</FormLabel>
              <div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={VisibleTo.JUST_ME}>Just me</SelectItem>
                    <SelectItem value={VisibleTo.PEOPLE_WITH_A_PASSCODE}>
                      People with a password
                    </SelectItem>
                    <SelectItem value={VisibleTo.EVERYONE}>Everyone</SelectItem>
                  </SelectContent>
                </Select>

                {errorDetails && showErrorDetail(errorDetails, "visibleTo")}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Passcode - Only shown when visibleTo is PEOPLE_WITH_A_PASSCODE */}
        {visibleTo === VisibleTo.PEOPLE_WITH_A_PASSCODE && (
          <FormField
            control={form.control}
            name="passcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter your passcode"
                      {...field}
                    />

                    {errorDetails && showErrorDetail(errorDetails, "passcode")}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Cards Table */}
        <div>
          <Table className="overflow-hidden">
            <TableHeader className="bg-secondary hover:bg-secondary">
              <TableRow>
                <TableHead className="w-4">No.</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="w-4"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    {index + 1}
                    <input
                      type="hidden"
                      {...form.register(`cards.${index}.id`)}
                    />
                  </TableCell>

                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`cards.${index}.term`}
                      render={({ field }) => {
                        const hasError =
                          form.formState.errors.cards?.[index]?.term;

                        return (
                          <FormItem>
                            <FormControl>
                              <Input
                                className={cn(
                                  hasError
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "",
                                  errorDetails &&
                                    showErrorBorder(
                                      errorDetails,
                                      `cards.${index}.term`,
                                    ),
                                )}
                                placeholder={`term ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`cards.${index}.definition`}
                      render={({ field }) => {
                        const hasError =
                          form.formState.errors.cards?.[index]?.definition;

                        return (
                          <FormItem>
                            <FormControl>
                              <Input
                                className={cn(
                                  hasError
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "",
                                  errorDetails &&
                                    showErrorBorder(
                                      errorDetails,
                                      `cards.${index}.definition`,
                                    ),
                                )}
                                placeholder={`def ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        fields.length > 4
                          ? remove(index)
                          : toast.error("You need at least 4 cards");
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-medium">Total cards: {fields.length}</p>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                append({
                  term: "",
                  definition: "",
                });
              }}
            >
              Add card <Plus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-4">
            <Button
              className="border-destructive text-destructive hover:bg-destructive"
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() =>
                startTransition(async () => {
                  const success = await DeleteSet(set.id);
                  if (success) {
                    toast.success("Set deleted successfully!");
                    router.replace("/library");
                  } else {
                    toast.error("Failed to delete set");
                  }
                })
              }
            >
              Delete <Trash2 className="inline h-4 w-4" />
            </Button>

            <div className="flex gap-4">
              <DialogClose ref={dialogCloseRef} asChild>
                <Button disabled={isPending} type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>

              <Button disabled={isPending} type="submit">
                Save changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
