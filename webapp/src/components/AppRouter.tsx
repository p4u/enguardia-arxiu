import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { HomePage } from '@/pages/HomePage'
import { EpisodePage } from '@/pages/EpisodePage'
import { SearchPage } from '@/pages/SearchPage'
import { StatsPage } from '@/pages/StatsPage'

export function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/episode/:id" element={<EpisodePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Layout>
  )
}
