import SettingsContent from "@/components/settings/SettingsContent";

/**
 * /settings/:view route — view selection comes from the URL param.
 * SettingsContent reads `view` via `useParams` so deep-links and refresh work.
 */
const SettingsPage = () => <SettingsContent />;

export default SettingsPage;
