#!/usr/bin/env bash
# agentic-tooling installer (macOS / Linux)
#
#   curl -fsSL https://raw.githubusercontent.com/AdrianLopezIglesias/agentic-tooling/main/install.sh | bash
#   bash install.sh --claude      # only install the Claude Code skill
#   bash install.sh --opencode    # only install the OpenCode plugin
#
# Clones (or git pulls) the repo into ~/.local/share/agentic-tooling, then
# copies the self-contained agentic-random/ folder into the discovery
# locations both tools auto-load. Idempotent: safe to re-run to update.
set -euo pipefail

REPO_URL="${AGENTIC_REPO_URL:-https://github.com/AdrianLopezIglesias/agentic-tooling}"
DEST="${AGENTIC_HOME:-$HOME/.local/share/agentic-tooling}"

install_claude=1
install_opencode=1
for arg in "$@"; do
  case "$arg" in
    --claude) install_opencode=0 ;;
    --opencode) install_claude=0 ;;
    *) echo "unknown option: $arg (use --claude or --opencode)" >&2; exit 2 ;;
  esac
done

command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
command -v node >/dev/null || echo "warning: node not found on PATH — the tool needs Node >= 20"

echo "==> Syncing repo to $DEST"
if [ -d "$DEST/.git" ]; then
  git -C "$DEST" pull --ff-only
else
  mkdir -p "$(dirname "$DEST")"
  git clone --depth 1 "$REPO_URL" "$DEST"
fi

copy_folder() { # $1 = target plugins/skills dir
  mkdir -p "$1"
  rm -rf "$1/agentic-random"
  cp -R "$DEST/agentic-random" "$1/agentic-random"
  echo "==> Installed to $1/agentic-random"
}

if [ "$install_claude" = 1 ]; then
  copy_folder "$HOME/.claude/skills"
  echo "    Claude Code watches this folder live (or run /reload-skills once)."
fi

if [ "$install_opencode" = 1 ]; then
  copy_folder "$HOME/.config/opencode/plugins"
  echo "    OpenCode auto-discovers package dirs here; restart the service if the tool is missing."
fi

echo "Done. Test it: node $DEST/agentic-random/cli.js integer --low 1 --high 6 --count 3"
