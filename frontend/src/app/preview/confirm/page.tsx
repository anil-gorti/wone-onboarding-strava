import ConfirmView from '@/components/confirm/ConfirmView'
import type { StravaConfirmData } from '@/lib/normalize'

const mockData: StravaConfirmData = {
  athlete: {
    id: 12345,
    name: 'Anil Gorti',
    username: 'anil_runs',
    photo: 'https://lh3.googleusercontent.com/a/ACg8ocK5R1dqFZEIer7rqdghm3u7wkOGI94O6k6mxpoSD3OtnOoPSg=s96-c',
    location: 'Bengaluru, Karnataka, India',
    sex: 'M',
  },
  stats: {
    ytd: { runs: 38, distanceKm: '612', hours: '63', elevationM: '4200' },
    allTime: { runs: 247, distanceKm: '4832' },
  },
  races: [
    { id: '1', name: 'Tata Mumbai Marathon', date: 'Jan 18, 2026', dateISO: '2026-01-18T06:00:00', distance: '42.2 km', distanceM: 42195, time: '3:23:57', type: 'Run' },
    { id: '2', name: 'DhaSh Bengaluru Half Marathon', date: 'Dec 8, 2025', dateISO: '2025-12-08T06:00:00', distance: '21.1 km', distanceM: 21097, time: '1:32:57', type: 'Run' },
    { id: '3', name: 'Niveus Mangalore Marathon', date: 'Nov 9, 2025', dateISO: '2025-11-09T06:00:00', distance: '21.1 km', distanceM: 21097, time: '1:35:13', type: 'Run' },
    { id: '4', name: 'Wipro Bengaluru Marathon', date: 'Sep 21, 2025', dateISO: '2025-09-21T06:00:00', distance: '42.2 km', distanceM: 42195, time: '3:26:16', type: 'Run' },
    { id: '5', name: 'Ooty Ultra 2025', date: 'Mar 23, 2025', dateISO: '2025-03-23T06:00:00', distance: '60 km', distanceM: 60000, time: '2:11:20', type: 'Run' },
  ],
}

export default function PreviewConfirmPage() {
  return <ConfirmView data={mockData} />
}
