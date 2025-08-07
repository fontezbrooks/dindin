import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to auth login initially
  // In a real app, you'd check if user is authenticated here
  return <Redirect href="/auth/login" />;
}
