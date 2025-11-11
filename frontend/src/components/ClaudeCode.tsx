export function ClaudeCode() {
  return (
    <div className="h-full w-full">
      <iframe
        id="claude-code-iframe"
        src="http://localhost:8081"
        className="w-full h-[calc(100vh-12rem)] border-none rounded-lg"
        allow="clipboard-read; clipboard-write"
        title="Claude Code WebUI"
      />
    </div>
  );
}
