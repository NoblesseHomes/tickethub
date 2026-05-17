export default async function Hledat({ searchParams }) {
  const params = await searchParams;

  const { query } = params;

  console.log(params);

  return <h1>Params Page</h1>;
}
