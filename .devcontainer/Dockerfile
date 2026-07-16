FROM mcr.microsoft.com/devcontainers/base:debian-12

ARG NODE_VERSION=22
ARG BUN_VERSION=1.3.14

USER vscode

# Install Node.js via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - \
    && sudo apt-get install -y --no-install-recommends nodejs \
    && sudo apt-get clean \
    && sudo rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash \
    && echo 'export BUN_INSTALL="$HOME/.bun"' >> $HOME/.bashrc \
    && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> $HOME/.bashrc

ENV BUN_INSTALL=/home/vscode/.bun
ENV PATH=/home/vscode/.bun/bin:${PATH}

# Install Astro CLI globally via bun
RUN bun add -g astro

# Install ImageMagick for image optimization tasks (block B6)
RUN sudo apt-get update \
    && sudo apt-get install -y --no-install-recommends imagemagick \
    && sudo apt-get clean \
    && sudo rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && npm --version && bun --version && astro --version
