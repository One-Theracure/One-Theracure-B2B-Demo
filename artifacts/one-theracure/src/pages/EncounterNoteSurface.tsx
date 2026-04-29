import { useOutletContext } from "react-router-dom";
import EncounterWorkspace from "@/components/cds/workspace/EncounterWorkspace";
import type { Encounter } from "@/services/encountersService";
import type { Patient } from "@/types/patient";

interface EncounterOutletContext {
  encounter: Encounter;
  patient: Patient | null;
}

/**
 * Default child of `/encounters/:id` — the documentation surface.
 * Wraps the existing `EncounterWorkspace`, pre-seeding it with the patient
 * and encounter resolved by the parent route. The sidebar stays interactive
 * so a clinician can still pivot to a different patient if they need to.
 */
const EncounterNoteSurface = () => {
  const { encounter, patient } = useOutletContext<EncounterOutletContext>();
  // `key={encounter.id}` forces a clean remount when the URL :id changes
  // (e.g. the workspace's patient picker created a new encounter and
  // navigated). Without this, EncounterWorkspace's `useState(initialPatient)`
  // would hold the previous encounter's state — chart-against-wrong-encounter
  // class of bug.
  return (
    <EncounterWorkspace
      key={encounter.id}
      initialEncounterId={encounter.id}
      initialPatient={patient}
    />
  );
};

export default EncounterNoteSurface;
