import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useMenuManager } from "../hooks/useMenu";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";

const CATEGORIES = ["starter","main","bread","rice","dessert","beverage","sides","specials"]
  .map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));

const EMPTY_FORM = { name:"", price:"", category:"starter", isVeg:true, description:"", spiceLevel:"" };

export default function MenuManager() {
  const {
    allItems, isLoading,
    createItem, updateItem, toggleAvailability, deleteItem, isCreating,
  } = useMenuManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("all");

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({
      name:        item.name,
      price:       String(item.price),
      category:    item.category,
      isVeg:       item.isVeg,
      description: item.description || "",
      spiceLevel:  item.spiceLevel  || "",
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const payload = {
      name:        form.name.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      isVeg:       form.isVeg,
      description: form.description.trim() || undefined,
      spiceLevel:  form.spiceLevel || undefined,
    };
    if (editItem) {
      updateItem({ id: editItem._id, d: payload });
    } else {
      createItem(payload);
    }
    setModalOpen(false);
  };

  const filtered = filterCat === "all"
    ? allItems
    : allItems.filter((i) => i.category === filterCat);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", ...CATEGORIES.map((c) => c.value)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                filterCat === cat ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {cat === "all" ? "All items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Add item
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="table-cell-base text-left font-medium text-gray-500">Item</th>
                <th className="table-cell-base text-left font-medium text-gray-500">Category</th>
                <th className="table-cell-base text-right font-medium text-gray-500">Price</th>
                <th className="table-cell-base text-center font-medium text-gray-500">Status</th>
                <th className="table-cell-base text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className={`border-b border-gray-50 hover:bg-gray-50 ${!item.isAvailable ? "opacity-50" : ""}`}>
                  <td className="table-cell-base">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-sm border-2 flex-shrink-0 ${item.isVeg ? "border-brand-600" : "border-red-500"}`} />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell-base">
                    <Badge variant="gray">{item.category}</Badge>
                  </td>
                  <td className="table-cell-base text-right font-medium">₹{item.price}</td>
                  <td className="table-cell-base text-center">
                    <button
                      onClick={() => toggleAvailability({ id: item._id, val: !item.isAvailable })}
                      title={item.isAvailable ? "Mark unavailable" : "Mark available"}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        item.isAvailable
                          ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {item.isAvailable ? <Eye size={11} /> : <EyeOff size={11} />}
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="table-cell-base text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) deleteItem(item._id); }}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">No items found</div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit item" : "Add menu item"}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input label="Item name *" value={form.name} onChange={(v) => setField("name", v)} placeholder="e.g. Paneer Tikka" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹) *" type="number" value={form.price} onChange={(v) => setField("price", v)} placeholder="220" />
            <Select label="Category *" value={form.category} onChange={(v) => setField("category", v)} options={CATEGORIES} />
          </div>

          <Input label="Description" value={form.description} onChange={(v) => setField("description", v)} placeholder="Short description..." />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Veg / Non-veg *"
              value={String(form.isVeg)}
              onChange={(v) => setField("isVeg", v === "true")}
              options={[{ value:"true", label:"Veg 🟢" }, { value:"false", label:"Non-veg 🔴" }]}
            />
            <Select
              label="Spice level"
              value={form.spiceLevel}
              onChange={(v) => setField("spiceLevel", v)}
              options={[
                { value:"",         label:"Not specified" },
                { value:"mild",     label:"Mild 🌶" },
                { value:"medium",   label:"Medium 🌶🌶" },
                { value:"hot",      label:"Hot 🌶🌶🌶" },
                { value:"extra_hot",label:"Extra hot 🌶🌶🌶🌶" },
              ]}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!form.name || !form.price || isCreating}
              className="btn-primary flex-1"
            >
              {isCreating ? "Saving..." : editItem ? "Save changes" : "Add item"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}