import { marked } from 'marked'
marked.use({ renderer: { html: () => '' } })

export default function Markdown({ body }) {
  return <div className="hub-md" dangerouslySetInnerHTML={{ __html: marked.parse(body) }} />
}
