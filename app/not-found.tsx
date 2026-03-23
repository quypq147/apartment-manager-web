import Link from "next/link"

function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>He thong bi loi . Quay lai  trang chu</p>
      <Link href="/">Quay ve trang chu</Link>
    </div>
  )
}

export default NotFoundPage