export default function Reveal() {

  const result = JSON.parse(
    localStorage.getItem("result")
  )

  return (
    <div>

      <h1>
        Impostor was: {result.impostor}
      </h1>

      <h2>
        Word was: {result.word}
      </h2>

      <h2>Votes</h2>

      {
        Object.entries(result.votes).map(
          ([name, votes]) => (
            <div key={name}>
              {name}: {votes}
            </div>
          )
        )
      }

    </div>
  )
}