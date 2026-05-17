function checkPagination(segments) {
  const token = segments[segments.length - 1];

  if (token.split("-")[0] !== "strana") return null;

  const page = Number(token.split("-")[1]);
  return page;
}

export default async function DynamicSearch({ params }) {
  const { segments } = await params;

  console.log(checkPagination(segments));

  return <h1>{segments}</h1>;
}
