





import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  Container,
  Stack,
  Grid,
  Card,
  Heading,
  Text,
  Button,
  DataTable,
  Badge,
  Avatar,
  SearchInput,
  FilterSelect,
  Pagination
} from "@xaheen-ai/design-system";

export const metadata: Metadata = {
  title: " | Admin",
  description: "",
  robots: "noindex, nofollow" // Admin pages should not be indexed
};

interface Props {
  params: { locale: string };
  searchParams: { 
    page?: string; 
    search?: string; 
    filter?: string; 
  };
}

/**
 *  - Admin page using Xala UI System
 * Norwegian compliant with WCAG 2.2 AAA accessibility standards
 */
export default function ({ 
  params, 
  searchParams 
}: Props): React.ReactElement {
  const t = useTranslations("");
  
  const currentPage = parseInt(searchParams.page || "1", 10);
  const searchQuery = searchParams.search || "";
  const filterValue = searchParams.filter || "all";

  // Mock data - replace with actual data fetching
  const mockData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "admin",
      lastLogin: "2024-01-15T10:30:00Z",
      avatar: "/avatars/john.jpg"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "pending",
      role: "user",
      lastLogin: "2024-01-14T15:45:00Z",
      avatar: "/avatars/jane.jpg"
    }
  ];

  const handleSearch = (query: string): void => {
    // Implement search logic
    console.log("Search:", query);
  };

  const handleFilter = (filter: string): void => {
    // Implement filter logic
    console.log("Filter:", filter);
  };

  const handleEdit = (id: number): void => {
    // Implement edit logic
    console.log("Edit:", id);
  };

  const handleDelete = (id: number): void => {
    // Implement delete logic
    console.log("Delete:", id);
  };

  return (
    <AdminLayout
      title={t("title")}
      breadcrumbs={[
        { label: t("breadcrumbs.home"), href: "/" },
        { label: t("breadcrumbs.admin"), href: "/admin" },
        { label: t("breadcrumbs.current"), href: "template string" }
      ]}
    >
      <Container variant="content" maxWidth="full">
        <Stack direction="vertical" spacing="6">
          {/* Page Header */}
          <Stack direction="horizontal" justify="between" align="center">
            <Stack direction="vertical" spacing="2">
              <Heading level={1} variant="page">
                {t("title")}
              </Heading>
              <Text variant="subtitle" color="secondary">
                {t("description")}
              </Text>
            </Stack>
            <Button variant="primary" size="lg">
              {t("actions.create")}
            </Button>
          </Stack>

          {/* Filters and Search */}
          <Card variant="outlined" padding="4">
            <Stack direction="horizontal" spacing="4" align="end">
              <SearchInput
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onSearch={handleSearch}
                aria-label={t("search.ariaLabel")}
                flex="1"
              />
              <FilterSelect
                value={filterValue}
                onChange={handleFilter}
                options={[
                  { value: "all", label: t("filters.all") },
                  { value: "active", label: t("filters.active") },
                  { value: "pending", label: t("filters.pending") },
                  { value: "inactive", label: t("filters.inactive") }
                ]}
                aria-label={t("filters.ariaLabel")}
              />
            </Stack>
          </Card>

          {/* Data Table */}
          <Card variant="elevated">
            <DataTable
              columns={[
                {
                  key: "user",
                  label: t("table.columns.user"),
                  sortable: true,
                  render: (_, row) => (
                    <Stack direction="horizontal" spacing="3" align="center">
                      <Avatar 
                        src={row.avatar} 
                        alt={row.name} 
                        size="md" 
                      />
                      <Stack direction="vertical" spacing="1">
                        <Text variant="body" weight="medium">
                          {row.name}
                        </Text>
                        <Text variant="caption" color="secondary">
                          {row.email}
                        </Text>
                      </Stack>
                    </Stack>
                  )
                },
                {
                  key: "status",
                  label: t("table.columns.status"),
                  sortable: true,
                  render: (value) => (
                    <Badge 
                      variant={
                        value === "active" ? "success" : 
                        value === "pending" ? "warning" : 
                        "error"
                      }
                    >
                      {t("template string")}
                    </Badge>
                  )
                },
                {
                  key: "role",
                  label: t("table.columns.role"),
                  sortable: true,
                  render: (value) => (
                    <Badge variant="info">
                      {t("template string")}
                    </Badge>
                  )
                },
                {
                  key: "lastLogin",
                  label: t("table.columns.lastLogin"),
                  sortable: true,
                  render: (value) => (
                    <Text variant="body">
                      {new Date(value).toLocaleDateString(params.locale)}
                    </Text>
                  )
                },
                {
                  key: "actions",
                  label: t("table.columns.actions"),
                  render: (_, row) => (
                    <Stack direction="horizontal" spacing="2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleClick}
                        aria-label={t("actions.edit.ariaLabel", { name: row.name })}
                      >
                        {t("actions.edit.label")}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        destructive
                        onClick={handleClick}
                        aria-label={t("actions.delete.ariaLabel", { name: row.name })}
                      >
                        {t("actions.delete.label")}
                      </Button>
                    </Stack>
                  )
                }
              ]}
              data={mockData}
              loading={false}
              emptyMessage={t("table.empty")}
              aria-label={t("table.ariaLabel")}
            />
          </Card>

          {/* Pagination */}
          <Stack direction="horizontal" justify="center">
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={(page) => console.log("Page:", page)}
              aria-label={t("pagination.ariaLabel")}
            />
          </Stack>
        </Stack>
      </Container>
    </AdminLayout>
  );
}
