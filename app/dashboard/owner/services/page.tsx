"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X, Zap } from "lucide-react";
import {
	createService,
	deleteService,
	getProperties,
	getServices,
	type OwnerProperty,
	type OwnerService,
	updateService,
} from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

export default function OwnerServicesPage() {
	const [services, setServices] = useState<OwnerService[]>([]);
	const [properties, setProperties] = useState<OwnerProperty[]>([]);
	const [search, setSearch] = useState("");
	const [propertyFilter, setPropertyFilter] = useState("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [creating, setCreating] = useState(false);
	const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
	const [updating, setUpdating] = useState(false);
	const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		propertyId: "",
		name: "",
		unit: "",
		price: "",
		isMetered: false,
	});
	const [editData, setEditData] = useState({
		name: "",
		unit: "",
		price: "",
		isMetered: false,
	});

	const loadData = async (selectedPropertyId?: string) => {
		setLoading(true);
		const [servicesRes, propertiesRes] = await Promise.all([
			getServices({
				propertyId: selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : undefined,
			}),
			getProperties(),
		]);

		if (!servicesRes.success || !propertiesRes.success) {
			setError(servicesRes.error ?? propertiesRes.error ?? "Không thể tải dữ liệu dịch vụ");
			setLoading(false);
			return;
		}

		setServices(servicesRes.data ?? []);
		setProperties(propertiesRes.data ?? []);
		setError(null);
		setLoading(false);
	};

	useEffect(() => {
		let cancelled = false;

		const loadOnMount = async () => {
			const [servicesRes, propertiesRes] = await Promise.all([getServices(), getProperties()]);

			if (cancelled) {
				return;
			}

			if (!servicesRes.success || !propertiesRes.success) {
				setError(servicesRes.error ?? propertiesRes.error ?? "Không thể tải dữ liệu dịch vụ");
				setLoading(false);
				return;
			}

			const loadedProperties = propertiesRes.data ?? [];
			setServices(servicesRes.data ?? []);
			setProperties(loadedProperties);
			setFormData((prev) => ({
				...prev,
				propertyId: prev.propertyId || loadedProperties[0]?.id || "",
			}));
			setError(null);
			setLoading(false);
		};

		void loadOnMount();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!propertyFilter) {
			return;
		}

		void loadData(propertyFilter);
	}, [propertyFilter]);

	const handleCreateService = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setCreating(true);
		setMessage(null);
		setError(null);

		const price = Number(formData.price);
		if (Number.isNaN(price) || price < 0) {
			setError("Đơn giá phải là số không âm");
			setCreating(false);
			return;
		}

		const result = await createService({
			propertyId: formData.propertyId,
			name: formData.name,
			unit: formData.unit,
			price,
			isMetered: formData.isMetered,
		});

		if (!result.success) {
			setError(result.error ?? "Không thể tạo dịch vụ");
			setCreating(false);
			return;
		}

		setFormData((prev) => ({
			...prev,
			name: "",
			unit: "",
			price: "",
			isMetered: false,
		}));
		setShowCreateForm(false);
		setMessage("Thêm dịch vụ thành công");
		setCreating(false);
		await loadData(propertyFilter);
	};

	const startEdit = (service: OwnerService) => {
		setEditingServiceId(service.id);
		setEditData({
			name: service.name,
			unit: service.unit,
			price: String(service.price),
			isMetered: service.isMetered,
		});
		setMessage(null);
		setError(null);
	};

	const handleUpdateService = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!editingServiceId) {
			return;
		}

		const price = Number(editData.price);
		if (Number.isNaN(price) || price < 0) {
			setError("Đơn giá phải là số không âm");
			return;
		}

		setUpdating(true);
		setMessage(null);
		setError(null);

		const result = await updateService(editingServiceId, {
			name: editData.name,
			unit: editData.unit,
			price,
			isMetered: editData.isMetered,
		});

		if (!result.success) {
			setError(result.error ?? "Không thể cập nhật dịch vụ");
			setUpdating(false);
			return;
		}

		setMessage("Cập nhật dịch vụ thành công");
		setUpdating(false);
		setEditingServiceId(null);
		await loadData(propertyFilter);
	};

	const handleDeleteService = async (service: OwnerService) => {
		const confirmed = window.confirm(`Bạn có chắc muốn xóa dịch vụ ${service.name}?`);
		if (!confirmed) {
			return;
		}

		setDeletingServiceId(service.id);
		setMessage(null);
		setError(null);

		const result = await deleteService(service.id);

		if (!result.success) {
			setError(result.error ?? "Không thể xóa dịch vụ");
			setDeletingServiceId(null);
			return;
		}

		setMessage("Xóa dịch vụ thành công");
		setDeletingServiceId(null);
		await loadData(propertyFilter);
	};

	const filteredServices = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		if (!keyword) {
			return services;
		}

		return services.filter((service) => {
			return (
				service.name.toLowerCase().includes(keyword) ||
				service.property.name.toLowerCase().includes(keyword) ||
				service.unit.toLowerCase().includes(keyword)
			);
		});
	}, [services, search]);

	const summary = useMemo(() => {
		return {
			totalServices: filteredServices.length,
			meteredServices: filteredServices.filter((service) => service.isMetered).length,
			avgPrice:
				filteredServices.length > 0
					? Math.round(
							filteredServices.reduce((sum, service) => sum + service.price, 0) /
								filteredServices.length
						)
					: 0,
		};
	}, [filteredServices]);

	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			<header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Quản lý Dịch vụ</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Quản lý bảng giá dịch vụ theo từng khu trọ để dùng khi lập hóa đơn.
					</p>
				</div>
				<button
					onClick={() => {
						setShowCreateForm((prev) => !prev);
						setError(null);
						setMessage(null);
					}}
					className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
				>
					<Plus className="w-4 h-4" />
					{showCreateForm ? "Đóng" : "Thêm dịch vụ"}
				</button>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="p-4 bg-card border border-border rounded-xl shadow-sm">
					<p className="text-sm font-medium text-muted-foreground">Tổng dịch vụ</p>
					<p className="text-2xl font-bold text-foreground mt-1">{summary.totalServices}</p>
				</div>
				<div className="p-4 bg-card border border-border rounded-xl shadow-sm">
					<p className="text-sm font-medium text-muted-foreground">Dịch vụ theo đồng hồ</p>
					<p className="text-2xl font-bold text-blue-600 mt-1">{summary.meteredServices}</p>
				</div>
				<div className="p-4 bg-card border border-border rounded-xl shadow-sm">
					<p className="text-sm font-medium text-muted-foreground">Đơn giá trung bình</p>
					<p className="text-2xl font-bold text-green-600 mt-1">{currency.format(summary.avgPrice)} đ</p>
				</div>
			</div>

			{showCreateForm && (
				<form
					onSubmit={handleCreateService}
					className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4"
				>
					<h3 className="font-semibold text-lg text-foreground">Thêm dịch vụ mới</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<select
							value={formData.propertyId}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, propertyId: event.target.value }))
							}
							required
							className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
						>
							<option value="">-- Chọn khu trọ --</option>
							{properties.map((property) => (
								<option key={property.id} value={property.id}>
									{property.name}
								</option>
							))}
						</select>

						<input
							type="text"
							value={formData.name}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, name: event.target.value }))
							}
							placeholder="Tên dịch vụ"
							required
							className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
						/>

						<input
							type="text"
							value={formData.unit}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, unit: event.target.value }))
							}
							placeholder="Đơn vị (kWh, m3, tháng...)"
							required
							className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
						/>

						<input
							type="number"
							min={0}
							value={formData.price}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, price: event.target.value }))
							}
							placeholder="Đơn giá"
							required
							className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
						/>

						<button
							disabled={creating}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
						>
							{creating ? "Đang lưu..." : "Lưu dịch vụ"}
						</button>
					</div>

					<label className="inline-flex items-center gap-2 text-sm text-foreground">
						<input
							type="checkbox"
							checked={formData.isMetered}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, isMetered: event.target.checked }))
							}
						/>
						Dịch vụ có chỉ số đồng hồ (điện, nước...)
					</label>
				</form>
			)}

			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Tìm theo tên dịch vụ, khu trọ, đơn vị..."
						className="w-full pl-9 pr-4 py-2 border border-input rounded-lg outline-none bg-background text-foreground"
					/>
				</div>

				<select
					value={propertyFilter}
					onChange={(event) => setPropertyFilter(event.target.value)}
					className="px-4 py-2 border border-input rounded-lg bg-background text-foreground"
				>
					<option value="all">Tất cả khu trọ</option>
					{properties.map((property) => (
						<option key={property.id} value={property.id}>
							{property.name}
						</option>
					))}
				</select>
			</div>

			{loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
			{error && <p className="text-sm text-red-600">{error}</p>}
			{message && <p className="text-sm text-green-600">{message}</p>}

			<div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden overflow-x-auto">
				<table className="w-full text-left text-sm text-muted-foreground">
					<thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase">
						<tr>
							<th className="px-6 py-4 font-medium">Dịch vụ</th>
							<th className="px-6 py-4 font-medium">Khu trọ</th>
							<th className="px-6 py-4 font-medium">Đơn vị</th>
							<th className="px-6 py-4 font-medium">Đơn giá</th>
							<th className="px-6 py-4 font-medium">Loại</th>
							<th className="px-6 py-4 font-medium text-right">Thao tác</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{!loading && filteredServices.length === 0 && (
							<tr>
								<td className="px-6 py-8 text-sm text-muted-foreground" colSpan={6}>
									Chưa có dịch vụ nào.
								</td>
							</tr>
						)}

						{filteredServices.map((service) => {
							const isEditing = editingServiceId === service.id;

							if (isEditing) {
								return (
									<tr key={service.id} className="bg-muted/30">
										<td className="px-6 py-4" colSpan={6}>
											<form
												onSubmit={handleUpdateService}
												className="grid grid-cols-1 lg:grid-cols-6 gap-3"
											>
												<input
													value={editData.name}
													onChange={(event) =>
														setEditData((prev) => ({ ...prev, name: event.target.value }))
													}
													className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
													placeholder="Tên dịch vụ"
													required
												/>
												<input
													value={editData.unit}
													onChange={(event) =>
														setEditData((prev) => ({ ...prev, unit: event.target.value }))
													}
													className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
													placeholder="Đơn vị"
													required
												/>
												<input
													type="number"
													min={0}
													value={editData.price}
													onChange={(event) =>
														setEditData((prev) => ({ ...prev, price: event.target.value }))
													}
													className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
													placeholder="Đơn giá"
													required
												/>
												<label className="inline-flex items-center gap-2 text-sm text-foreground px-3">
													<input
														type="checkbox"
														checked={editData.isMetered}
														onChange={(event) =>
															setEditData((prev) => ({ ...prev, isMetered: event.target.checked }))
														}
													/>
													Theo đồng hồ
												</label>
												<div className="lg:col-span-2 flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => setEditingServiceId(null)}
														className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-foreground"
													>
														<X className="w-4 h-4" />
														Hủy
													</button>
													<button
														disabled={updating}
														className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
													>
														{updating ? "Đang lưu..." : "Lưu cập nhật"}
													</button>
												</div>
											</form>
										</td>
									</tr>
								);
							}

							return (
								<tr key={service.id} className="hover:bg-muted/50 transition-colors">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
												<Zap className="w-4 h-4" />
											</div>
											<span className="font-medium text-foreground">{service.name}</span>
										</div>
									</td>
									<td className="px-6 py-4 text-foreground">{service.property.name}</td>
									<td className="px-6 py-4 text-foreground">{service.unit}</td>
									<td className="px-6 py-4 font-medium text-foreground">{currency.format(service.price)} đ</td>
									<td className="px-6 py-4">
										<span
											className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
												service.isMetered
													? "bg-blue-100 text-blue-700"
													: "bg-emerald-100 text-emerald-700"
											}`}
										>
											{service.isMetered ? "Theo đồng hồ" : "Cố định"}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => startEdit(service)}
												className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-md text-foreground hover:bg-muted"
											>
												<Pencil className="w-3.5 h-3.5" />
												Sửa
											</button>
											<button
												disabled={deletingServiceId === service.id}
												onClick={() => void handleDeleteService(service)}
												className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-60"
											>
												<Trash2 className="w-3.5 h-3.5" />
												{deletingServiceId === service.id ? "Đang xóa..." : "Xóa"}
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
