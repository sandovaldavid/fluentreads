FROM mcr.microsoft.com/devcontainers/base:debian-12

ARG NODE_VERSION=22
ARG BUN_VERSION=1.3.14

USER vscode

RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | sudo -E bash - \
    && sudo apt-get install -y --no-install-recommends nodejs imagemagick \
    && sudo apt-get clean \
    && sudo rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"

ENV BUN_INSTALL=/home/vscode/.bun
ENV PATH=/home/vscode/.bun/bin:${PATH}

RUN node --version && bun --version
