import React, { useState } from "react";
import { Text, View } from "react-native";
import AdminGenericList from "../screens/admin/AdminGenericList";

export default function AdminListLoader({ title, fetcher, renderItem, onBack }: { title: string, fetcher: () => Promise<any>, renderItem: (item: any) => React.ReactNode, onBack: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetcher()
      .then(res => {
          const list = res.bids || res.payments || res.notifications || res.listings || res.appointments || res;
          setData(Array.isArray(list) ? list : []);
      })
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Loading {title}...</Text></View>;

  return <AdminGenericList title={title} onBack={onBack} data={data} renderItem={renderItem} />;
}
