export NVM_DIR="$HOME/.nvm"

# This loads nvm.sh.
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# If there's a .nvmrc file in the project, use the relevant node version.
if [[ -f ".nvmrc" ]]; then
    nvm use
fi