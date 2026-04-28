const VERSION_PREFIX = "version-history:";
const MAX_VERSIONS = 20;

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  contentMarkdown: string;
  savedAt: string;
  source: "autosave" | "manual" | "ai-generated" | "restore";
}

function storageKey(documentId: string): string {
  return VERSION_PREFIX + documentId;
}

export function getVersions(documentId: string): DocumentVersion[] {
  try {
    const raw = localStorage.getItem(storageKey(documentId));
    if (!raw) return [];
    return JSON.parse(raw) as DocumentVersion[];
  } catch {
    return [];
  }
}

export function saveVersion(
  documentId: string,
  contentMarkdown: string,
  source: DocumentVersion["source"] = "manual"
): DocumentVersion {
  const versions = getVersions(documentId);
  const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

  const entry: DocumentVersion = {
    id: `${documentId}-v${nextVersion}`,
    documentId,
    version: nextVersion,
    contentMarkdown,
    savedAt: new Date().toISOString(),
    source,
  };

  const updated = [entry, ...versions].slice(0, MAX_VERSIONS);
  localStorage.setItem(storageKey(documentId), JSON.stringify(updated));
  return entry;
}

export function restoreVersion(
  documentId: string,
  versionId: string
): DocumentVersion | null {
  const versions = getVersions(documentId);
  const target = versions.find((v) => v.id === versionId);
  if (!target) return null;

  saveVersion(documentId, target.contentMarkdown, "restore");
  return target;
}

export function clearVersions(documentId: string): void {
  localStorage.removeItem(storageKey(documentId));
}
