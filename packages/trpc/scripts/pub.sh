# Workaround for pnpm not replacing "workspace:*"" when publishing
# From https://github.com/pnpm/pnpm/issues/6269#issuecomment-1482879661
pnpm --filter $1 deploy --prod tmp/pruned \
	&& cd tmp/pruned \
	&& pnpm pack \
	&& tar -zxvf *.tgz package/package.json \
	&& rm package.json \
	&& mv package/package.json package.json \
	&& rm *.tgz \
  && pnpm pub:pruned $2
