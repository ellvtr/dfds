import { type Vessel } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Head from "next/head";
import { NewVoyageForm } from "~/components/NewVoyageForm";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Toaster } from "~/components/ui/toaster";
import { useToast } from "~/components/ui/use-toast";
import { TABLE_DATE_FORMAT } from "~/constants";
import { fetchData } from "~/utils";
import type { ReturnType } from "./api/voyage/getAll";

export default function Home() {
  const { data: voyages } = useQuery<ReturnType>(["voyages"], () => fetchData("voyage/getAll"));
  const { data: vessels } = useQuery<Vessel[]>(["vessels"], () => fetchData("vessels/getAll"));

  const { toast } = useToast();

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the voyage");
      }
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["voyages"]);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: String(error),
        });
      },
    }
  );

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sheet>
        <SheetTrigger
          style={{
            backgroundColor: "white",
            color: "black",
            display: "block",
            margin: "0.5rem auto",
            padding: "0.5rem",
            borderRadius: "0.5rem",
          }}
        >
          {/* Not using Button component here, as I get a warning not to nest a button within a button;
          it turns out that SheetTrigger is a button element. */}
          New voyage
        </SheetTrigger>
        <SheetContent>
          <NewVoyageForm vessels={vessels} />
        </SheetContent>
      </Sheet>
      <Layout>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Port of loading</TableHead>
              <TableHead>Port of discharge</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voyages?.map((voyage) => (
              <TableRow key={voyage.id}>
                <TableCell>{format(new Date(voyage.scheduledDeparture), TABLE_DATE_FORMAT)}</TableCell>
                <TableCell>{format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}</TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(voyage.id)} variant="outline">
                    X
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
      {/* Voyage count for debugging purposes: */}
      <div style={{ margin: "1rem", textAlign: "center" }}>
        <p>Number of voyages: {voyages?.length}</p>
      </div>
      <Toaster />
    </>
  );
}
