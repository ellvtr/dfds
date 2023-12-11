import type { Vessel } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { SheetClose, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { type NewVoyageQueryPayload } from "~/pages/api/voyage/add";

type Props = {
  vessels: Vessel[] | null | undefined;
};

export const NewVoyageForm = (props: Props) => {
  const { vessels } = props;
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation(
    async (values: NewVoyageQueryPayload) => {
      const keys = Object.keys(values) as (keyof NewVoyageQueryPayload)[];
      const queryString = keys.reduce((acc, key) => (acc += `&${key}=${values[key]}`), "");

      const response = await fetch(`/api/voyage/add?${queryString}`, { method: "PUT" });

      if (!response.ok) {
        throw new Error("Failed to create the voyage");
      }
    },
    {
      onSuccess: () => {
        // This is a hack, but "sheet" doesn't seem to export a way to close it programmatically:
        document.getElementById("cancelNewVoyage")?.click();
      },
    }
  );

  const handleCreate = (values: NewVoyageQueryPayload) => {
    mutation.mutate(values);
  };

  if (!vessels) return <ErrorLine>Error: Vessel data missing</ErrorLine>;

  return (
    <SheetHeader>
      <SheetTitle>Crete new voyage</SheetTitle>

      <label htmlFor="portOfLoading">Port of loading</label>
      <input type="text" id="portOfLoading" name="portOfLoading" />

      <label htmlFor="portOfLoading">Port of discharge</label>
      <input type="text" id="portOfDischarge" name="portOfDischarge" />

      <label htmlFor="scheduledDeparture">Departure</label>
      <input type="datetime-local" id="scheduledDeparture" name="scheduledDeparture" />

      <label htmlFor="scheduledDeparture">Arrival</label>
      <input type="datetime-local" id="scheduledArrival" name="scheduledArrival" />

      <label htmlFor="vessel">Vessel</label>
      <select name="vessel" id="vessel">
        {vessels.map((vessel) => (
          <option key={vessel.id} value={vessel.id}>
            {vessel.name}
          </option>
        ))}
      </select>

      <div>
        {errors.map((error) => (
          <ErrorLine key={error}>{error}</ErrorLine>
        ))}
      </div>

      <Button
        onClick={() => {
          const values = getValues();
          const errors = getFormErrors(values);
          errors ? setErrors(errors) : setErrors([]);
          if (!errors) handleCreate(values);
        }}
      >
        Submit
      </Button>
      <SheetClose style={{ width: "100%" }} id="cancelNewVoyage">
        {/* Not using Button component here, as I cannot nest a button within a button;
          it turns out that SheetClose is a button element. */}
        Cancel
      </SheetClose>
    </SheetHeader>
  );
};

/*
NB: I'm aware that 'react-query' or other libraries in this project 
may have form functionality and validation built-in 
- similar to Formik which I have used around 2 years ago. 
However, it was quicker for me to create my own in this case,
than to learn a new library.
*/

/** Get form values from DOM, quick and dirty */
const getValues = () => {
  const depStr = (document.getElementById("scheduledDeparture") as HTMLInputElement)?.value;
  const depIso = new Date(depStr).toISOString();

  const arrStr = (document.getElementById("scheduledArrival") as HTMLInputElement)?.value;
  const arrIso = new Date(arrStr).toISOString();

  const values: NewVoyageQueryPayload = {
    portOfLoading: (document.getElementById("portOfLoading") as HTMLInputElement)?.value,
    portOfDischarge: (document.getElementById("portOfDischarge") as HTMLInputElement)?.value,
    vesselId: (document.getElementById("vessel") as HTMLInputElement)?.value,
    scheduledDeparture: depIso,
    scheduledArrival: arrIso,
  };

  return values;
};

/** Get form errors if any, otherwise return null */
const getFormErrors = (values: NewVoyageQueryPayload) => {
  const errors: string[] = [];

  if (!values.portOfLoading) errors.push("Port of loading required");

  if (!values.portOfDischarge) errors.push("Port of discharge required");

  if (!values.scheduledDeparture) errors.push("Departure required");

  if (!values.scheduledArrival) errors.push("Arrival required");

  if (!values.vesselId) errors.push("Vessel required");

  if (new Date(values.scheduledArrival).valueOf() < new Date(values.scheduledDeparture).valueOf()) {
    errors.push("Arrival must be after departure");
  }

  return errors.length ? errors : null;
};

const ErrorLine = (props: { children: React.ReactNode }) => {
  return <p style={{ color: "red" }}>{props.children}</p>;
};
