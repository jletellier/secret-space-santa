import clientPromise from "@/lib/mongodb";

async function getData() {
  try {
    const client = await clientPromise
    const db = client.db("sss")

    const groups = await db
      .collection("groups")
      .find({})
      .limit(20)
      .toArray();

    return {
      groups: JSON.parse(JSON.stringify(groups)),
    }
  } catch (e) {
    console.error(e)
  }
}

export default async function Page() {
  const data = await getData() as any

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {data.groups.map((group: any) => (
          <li key={group._id}>
            <h2>{group.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  )
}