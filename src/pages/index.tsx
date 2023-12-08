import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Head from "next/head";
import { NewVoyageForm } from "~/components/NewVoyageForm";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TABLE_DATE_FORMAT } from "~/constants";
import { fetchData } from "~/utils";
import type { ReturnType } from "./api/voyage/getAll";

export default function Home() {
  const { data: voyages } = useQuery<ReturnType>(["voyages"], () =>
    fetchData("voyage/getAll")
  );

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
    }
  );

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger
          style={{
            backgroundColor: "white",
            color: "black",
            margin: "0.5rem",
            padding: "0.5rem",
            borderRadius: "0.5rem",
          }}
        >
          {/* Not using Button component here, as I get a warning not to nest a button within a button;
          it turns out that SheetTrigger is a button element. */}
          New voyage
        </SheetTrigger>
        <SheetContent>
          <NewVoyageForm />
        </SheetContent>
      </Sheet>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                <TableCell>
                  {format(
                    new Date(voyage.scheduledDeparture),
                    TABLE_DATE_FORMAT
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}
                </TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(voyage.id)}
                    variant="outline"
                  >
                    X
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
      <div style={{ margin: "1rem" }}>
        <p>Number of voyages: {voyages?.length}</p>
      </div>
    </>
  );
}
